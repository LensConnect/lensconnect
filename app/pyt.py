import os
import pandas as pd

# =========================================================================
# CONFIGURATION - UPDATE THESE PATHS TO MATCH YOUR COMPUTER
# =========================================================================
INPUT_FILE_PATH = r"C:\Users\Isreal\Downloads\converted.csv" # Change to where your messy file is
OUTPUT_FILE_PATH = r"C:\Users\Isreal\lensconnect\converted.csv"

# Map your target database fields to your messy Excel column names.
# Column1 is now assigned to the primary key 'id'.
column_mapping = {
    'id':           'cid',
    'title':        'title',
    'city':         'city',
    'state':        'state',
    'countryCode':  'countryCode',
    'reviewsCount': 'reviewsCount',
    'totalScore':    'totalScore',
    'categoryName': 'categoryName',
    'website':      'website',
    'phone':        'phone',
    'url':          'url',
    'street':       'street'
}


def clean_scraper_data():
    print("Loading messy file...")
    
    if INPUT_FILE_PATH.endswith('.xlsx'):
        df = pd.read_excel(INPUT_FILE_PATH)
    else:
        df = pd.read_csv(INPUT_FILE_PATH, low_memory=False, encoding='cp1252')

    print("Cleaning data extraction layout...")
    cleaned_data = {}

    for db_col, excel_col in column_mapping.items():
        if excel_col in df.columns:
            cleaned_data[db_col] = df[excel_col].astype(str).str.strip()
        else:
            print("Warning: Column '{}' not detected in file. Setting as empty.".format(excel_col))
            cleaned_data[db_col] = ""

    clean_df = pd.DataFrame(cleaned_data)

    # Set ID to empty so MySQL auto-increments
    clean_df['id'] = ''

    # Force strict integer columns to numbers (and fall back to 0 or valid integers)
    for int_col in ['reviewsCount', 'totalScore']:
        clean_df[int_col] = pd.to_numeric(clean_df[int_col], errors='coerce').fillna(0).astype(int)

    # Strip out literal string 'nan' or 'None' values produced by empty row conversion
    clean_df = clean_df.replace(['nan', 'None', 'NaN', 'NAN'], '')

    # Save cleanly structured file directly into MySQL's safe folder zone
    os.makedirs(os.path.dirname(OUTPUT_FILE_PATH), exist_ok=True)
    clean_df.to_csv(OUTPUT_FILE_PATH, index=False, encoding='cp1252')
    
    print("Clean up complete!")
    print("Perfect file saved to: {}".format(OUTPUT_FILE_PATH))

if __name__ == "__main__":
    clean_scraper_data()
