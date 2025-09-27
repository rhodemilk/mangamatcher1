#!/usr/bin/env python3
"""
Script to load manga dataset into the database
"""

from app import app, db, Manga
import pandas as pd
import os
import sys
from datetime import datetime

# Add the backend directory to the path so we can import from app.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def load_manga_dataset(csv_file_path):
    """Load manga data from CSV file into the database"""

    if not os.path.exists(csv_file_path):
        print(f"Error: CSV file not found at {csv_file_path}")
        return False

    try:
        # Read the CSV file
        print(f"Reading CSV file: {csv_file_path}")
        df = pd.read_csv(csv_file_path)

        print(f"Found {len(df)} manga entries in the dataset")
        print(f"Columns: {list(df.columns)}")

        # Clear existing manga data (optional - comment out if you want to keep existing data)
        print("Clearing existing manga data...")
        Manga.query.delete()
        db.session.commit()

        # Load data into database
        loaded_count = 0
        for index, row in df.iterrows():
            try:
                # Handle missing values and data type conversion
                def safe_int(value):
                    try:
                        return int(value) if pd.notna(value) and str(value).strip() else None
                    except (ValueError, TypeError):
                        return None

                def safe_float(value):
                    try:
                        return float(value) if pd.notna(value) and str(value).strip() else 0.0
                    except (ValueError, TypeError):
                        return 0.0

                def safe_str(value):
                    return str(value) if pd.notna(value) else ''

                manga = Manga(
                    title=safe_str(row.get('manga', '')),
                    author=safe_str(row.get('author', '')),
                    publisher=safe_str(row.get('publisher', '')),
                    demographic=safe_str(row.get('demographic', '')),
                    num_of_vol=safe_int(row.get('num_of_vol')),
                    serialized=safe_str(row.get('serialized', '')),
                    sales=safe_str(row.get('sales', '')),
                    sales_per_vol=safe_str(row.get('sales_per_vol', '')),
                    genre=safe_str(row.get('genre', '')),
                    isbn_10=safe_str(row.get('isbn_10', '')),
                    isbn_13=safe_str(row.get('isbn_13', '')),
                    description=safe_str(row.get('description', '')),
                    cover_image_url=safe_str(row.get('cover_image_url', '')),
                    tags=safe_str(row.get('tags', '')),
                    rating_avg=safe_float(row.get('rating_avg')),
                    year=safe_int(row.get('year')),
                    year_bucket=safe_str(row.get('year_bucket', '')),
                    amazon_link=safe_str(row.get('amazon_link', '')),
                    created_at=datetime.utcnow()
                )

                db.session.add(manga)
                loaded_count += 1

                if loaded_count % 100 == 0:
                    print(f"Loaded {loaded_count} manga entries...")

            except Exception as e:
                print(f"Error loading row {index}: {e}")
                continue

        # Commit all changes
        db.session.commit()
        print(
            f"Successfully loaded {loaded_count} manga entries into the database!")

        return True

    except Exception as e:
        print(f"Error loading dataset: {e}")
        db.session.rollback()
        return False


def main():
    """Main function to run the data loading"""

    # Check if CSV file exists
    csv_file = "manga_with_amazon_links.csv"
    csv_path = os.path.join(os.path.dirname(__file__), csv_file)

    if not os.path.exists(csv_path):
        print(f"CSV file not found at {csv_path}")
        print("Please make sure the manga dataset CSV file is in the backend directory")
        return

    # Create database tables
    with app.app_context():
        print("Creating database tables...")
        db.create_all()

        # Load the dataset
        success = load_manga_dataset(csv_path)

        if success:
            print("Dataset loading completed successfully!")

            # Show some statistics
            total_manga = Manga.query.count()
            print(f"Total manga in database: {total_manga}")

            # Show unique genres
            genres = db.session.query(Manga.genre).distinct().all()
            print(f"Unique genres: {[g[0] for g in genres if g[0]]}")

            # Show unique demographics
            demographics = db.session.query(Manga.demographic).distinct().all()
            print(
                f"Unique demographics: {[d[0] for d in demographics if d[0]]}")

        else:
            print("Dataset loading failed!")


if __name__ == "__main__":
    main()
