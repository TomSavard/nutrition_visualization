import csv

# Open the input CSV file with the old separator (e.g., semicolon)
with open('/Users/savardtom/Desktop/3A/CSC_51052_EP/Projet/data/food_table.csv', mode='r', newline='', encoding='utf-8') as infile:
    # Create a CSV reader with the semicolon separator
    csv_reader = csv.reader(infile, delimiter=';')
    
    # Open the output CSV file with the new separator (comma)
    with open('/Users/savardtom/Desktop/3A/CSC_51052_EP/Projet/data/food_table_new.csv', mode='w', newline='', encoding='utf-8') as outfile:
        # Create a CSV writer with the comma separator
        csv_writer = csv.writer(outfile, delimiter=',')
        
        # Write all rows from the original file to the new file with the new separator
        for row in csv_reader:
            csv_writer.writerow(row)

print("CSV separator has been changed.")