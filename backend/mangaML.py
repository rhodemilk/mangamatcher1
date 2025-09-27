import os
from typing import List, Dict, Any, Optional, Set

import pandas as pd
import numpy as np


def _data_path(filename: str) -> str:
	"""Return absolute path to data file placed next to this module."""
	base = os.path.dirname(os.path.abspath(__file__))
	return os.path.join(base, filename)


class MangaRecommender:
	"""Simple content-based recommender focused on genres/tags and demographic.

	Contract (minimal API):
	- Inputs: user provides likes/dislikes via `record_feedback(title_or_index, liked)`
	- Output: `recommend(n)` returns a list of candidate dicts with score
	- Profile export/import: `export_profile()` / `load_profile(profile)` to persist

	Error modes: raises ValueError when title not found; methods are tolerant to empty feedback.
	"""

	def __init__(self, csv_filename: str = "manga_with_amazon_links.csv"):
		self.df = pd.read_csv(_data_path(csv_filename))
		# normalize column names for safe access
		self.df.columns = [c.strip() for c in self.df.columns]
		# create tokens (set) combining `genre`, `tags`, and `demographic`
		self.df["_tokens"] = self.df.apply(self._row_tokens, axis=1)

		# internal user feedback: index -> +1 (like) or -1 (dislike)
		self.feedback: Dict[int, int] = {}
		# token weights aggregated from feedback
		self.token_weights: Dict[str, float] = {}
		# demographic weights aggregated from feedback
		self.demographic_weights: Dict[str, float] = {}

	def _row_tokens(self, row: pd.Series) -> Set[str]:
		parts: List[str] = []
		# genre column often contains a single word like 'Action'
		if pd.notna(row.get("genre")):
			parts.append(str(row.get("genre")))
		# tags column contains comma-separated descriptors
		if pd.notna(row.get("tags")):
			parts.append(str(row.get("tags")))
		# demographic column (e.g., 'Shōnen', 'Seinen')
		if pd.notna(row.get("demographic")):
			parts.append(str(row.get("demographic")))
		tokens = set()
		for p in parts:
			# split on comma and slash and other delimiters and normalize
			for t in [t.strip() for t in re_split(p) if t.strip()]:
				tokens.add(t.lower())
		return tokens

	def _index_for_title(self, title: str) -> Optional[int]:
		# favor exact case-insensitive match on `manga` column
		mask = self.df["manga"].str.lower() == title.strip().lower()
		matches = self.df[mask]
		if not matches.empty:
			return int(matches.index[0])
		return None

	def record_feedback(self, title_or_index: Any, liked: bool) -> None:
		"""Record a like (True) or dislike (False). Accepts title (str) or index (int).

		Updates internal feedback map and recomputes token/demographic weights.
		"""
		if isinstance(title_or_index, str):
			idx = self._index_for_title(title_or_index)
			if idx is None:
				raise ValueError(f"Title not found: {title_or_index}")
		else:
			idx = int(title_or_index)
			if idx not in self.df.index:
				raise ValueError(f"Index out of range: {idx}")

		self.feedback[idx] = 1 if liked else -1
		self._recompute_weights()

	def _recompute_weights(self) -> None:
		tw: Dict[str, float] = {}
		dw: Dict[str, float] = {}
		for idx, score in self.feedback.items():
			tokens = self.df.at[idx, "_tokens"]
			for t in tokens:
				tw[t] = tw.get(t, 0.0) + float(score)
			demo = str(self.df.at[idx, "demographic"]) if pd.notna(self.df.at[idx, "demographic"]) else ""
			if demo:
				dw[demo.lower()] = dw.get(demo.lower(), 0.0) + float(score)
		self.token_weights = tw
		self.demographic_weights = dw

	def recommend(self, n: int = 10, exclude_seen: bool = True) -> List[Dict[str, Any]]:
		"""Return up to `n` recommendations sorted by score.

		Score is a simple linear combination of token match score and demographic score.
		If no feedback exists, fall back to `rating_avg` and `sales` as popularity signals.
		"""
		if not self.feedback:
			# cold start: return top by rating_avg then sales
			if "rating_avg" in self.df.columns:
				df_sorted = self.df.sort_values(by=[c for c in ["rating_avg", "sales"] if c in self.df.columns], ascending=False)
			else:
				df_sorted = self.df
			df_sorted = df_sorted.head(n)
			return [self._row_to_result(i, row, score=None) for i, row in df_sorted.iterrows()]

		results = []
		for i, row in self.df.iterrows():
			if exclude_seen and i in self.feedback:
				continue
			tokens = row["_tokens"]
			if not tokens:
				tok_score = 0.0
			else:
				tok_score = sum(self.token_weights.get(t, 0.0) for t in tokens) / max(1.0, len(tokens))
			demo = str(row.get("demographic", "")).lower() if pd.notna(row.get("demographic")) else ""
			demo_score = self.demographic_weights.get(demo, 0.0)
			# small popularity tie-breaker
			pop = 0.0
			if "rating_avg" in row and not pd.isna(row.get("rating_avg")):
				try:
					pop = float(row.get("rating_avg")) / 100.0
				except Exception:
					pop = 0.0
			score = tok_score + 0.5 * demo_score + 0.2 * pop
			results.append((score, i, row))

		results.sort(key=lambda x: x[0], reverse=True)
		out = []
		for score, i, row in results[:n]:
			out.append(self._row_to_result(i, row, score))
		return out

	def get_next_for_swipe(self) -> Optional[Dict[str, Any]]:
		"""Convenience method: return single top candidate for immediate swipe UI."""
		recs = self.recommend(n=1)
		return recs[0] if recs else None

	def _row_to_result(self, idx: int, row: pd.Series, score: Optional[float]) -> Dict[str, Any]:
		return {
			"index": int(idx),
			"title": row.get("manga"),
			"author": row.get("author"),
			"cover_image_url": row.get("cover_image_url"),
			"amazon_link": row.get("amazon_link"),
			"score": None if score is None else float(score),
		}

	def export_profile(self) -> Dict[str, Any]:
		return {"feedback": self.feedback, "token_weights": self.token_weights, "demographic_weights": self.demographic_weights}

	def load_profile(self, profile: Dict[str, Any]) -> None:
		self.feedback = {int(k): int(v) for k, v in profile.get("feedback", {}).items()}
		self.token_weights = {str(k): float(v) for k, v in profile.get("token_weights", {}).items()}
		self.demographic_weights = {str(k): float(v) for k, v in profile.get("demographic_weights", {}).items()}


def re_split(s: str) -> List[str]:
	"""Split a string on a few common delimiters, return list of parts."""
	# avoid importing regex module repeatedly
	for delim in [",", "/", "|", "-", "–"]:
		s = s.replace(delim, ",")
	return [p.strip() for p in s.split(",") if p is not None]


def smoke_test():
	"""Quick in-module smoke test demonstrating usage.

	This function is intentionally small and safe to run during dev/test. It does not modify
	the dataset on disk.
	"""
	rec = MangaRecommender()
	# try a cold-start recommendation
	print("Cold-start top 3 (titles):")
	for r in rec.recommend(3):
		print(r["title"])

	# provide a few likes and dislikes by title if present in dataset
	sample_likes = ["One Piece", "Death Note", "Berserk"]
	for t in sample_likes:
		try:
			rec.record_feedback(t, liked=True)
		except ValueError:
			# ignore if title not present
			pass

	print("After liking some titles, next recommendation:")
	nxt = rec.get_next_for_swipe()
	print(nxt)


if __name__ == "__main__":
	# run the small smoke test when module executed directly
	try:
		smoke_test()
	except Exception as e:
		print("Smoke test failed:", e)
