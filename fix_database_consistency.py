#!/usr/bin/env python3
"""
Database Consistency Fix Script

This script fixes inconsistent year_bucket values in the MangaMatcher database.
It standardizes the year_bucket field to ensure consistent quiz options.

Issues fixed:
- "Modern" (capitalized) -> "modern" (lowercase)
- Empty strings -> "unknown"

Run this script if you notice duplicate year_bucket values in quiz options.
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import app, db, Manga

def fix_year_bucket_consistency():
    """Fix inconsistent year_bucket values in the database"""
    with app.app_context():
        print("🔧 Fixing year_bucket consistency issues...")
        
        # Check current state
        year_buckets = db.session.query(Manga.year_bucket).distinct().all()
        print("Current year_bucket values:")
        for bucket in year_buckets:
            print(f"  \"{bucket[0]}\"")
        
        # Fix 'Modern' -> 'modern'
        updated_modern = db.session.query(Manga).filter(Manga.year_bucket == 'Modern').update({'year_bucket': 'modern'})
        if updated_modern > 0:
            print(f"✅ Updated {updated_modern} entries from 'Modern' to 'modern'")
        
        # Fix empty strings -> 'unknown'
        updated_empty = db.session.query(Manga).filter(Manga.year_bucket == '').update({'year_bucket': 'unknown'})
        if updated_empty > 0:
            print(f"✅ Updated {updated_empty} entries from empty string to 'unknown'")
        
        # Commit changes
        db.session.commit()
        print("✅ Changes committed successfully!")
        
        # Verify the fix
        year_buckets_after = db.session.query(Manga.year_bucket).distinct().all()
        print("\nYear buckets after fix:")
        for bucket in year_buckets_after:
            print(f"  \"{bucket[0]}\"")
        
        print("\n🎉 Database consistency fix completed!")

if __name__ == "__main__":
    fix_year_bucket_consistency()
