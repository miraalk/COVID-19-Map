# This script parser a FSA boundary file to a mapping of FSAs to polygons.
# FSAs (forward sortation areas) are the first 3 digit of your postal code.

# The FSA boundary files are simplified versions of the Statistics Canada files (see README for references).
# I used https://mapshaper.org/ to simply the Statistic Canada files.

import json
import pyproj

ONTARIO_CODE = 35

# Number of decimal places to keep in lat-long coordinates
# 4 decimal places gives 11m accuracy according to http://wiki.gis.com/wiki/index.php/Decimal_degrees
ROUNDING_ACCURACY = 4

# The formats used by Stats Can according to https://epsg.io/3347
CONVERT_IN_PROJ = pyproj.Proj('epsg:3347')
CONVERT_OUT_PROJ = pyproj.Proj('epsg:4326')

TRANSFORMER = pyproj.Transformer.from_proj(CONVERT_IN_PROJ, CONVERT_OUT_PROJ, always_xy=True)


def read_data(filename):
    with open(filename, 'r') as file:
        input_data = json.load(file)

        output_data = {}

        for fsa_feature in input_data['features']:

            fsa_code = fsa_feature['properties']['CFSAUID']
            # province_code = int(fsa_feature['properties']['PRUID'])

            polygons = []

            coordinates_node = fsa_feature['geometry']['coordinates']
            if fsa_feature['geometry']['type'] == 'Polygon':
                for polygon_coordinates in coordinates_node:
                    polygons.append(get_polygon(polygon_coordinates))
            elif fsa_feature['geometry']['type'] == 'MultiPolygon':
                for polygon_coordinates in coordinates_node:
                    for sub_polygon_coordinates in polygon_coordinates:
                        polygons.append(get_polygon(sub_polygon_coordinates))
            else:
                print("There was a problem with the input_data.")

            output_data[fsa_code] = polygons

        return output_data


def get_polygon(coordinates):
    polygon = []

    for lat, lng in TRANSFORMER.itransform(coordinates):
        polygon.append({'lat': (round(lat, ROUNDING_ACCURACY)),
                        'lng': (round(lng, ROUNDING_ACCURACY))})
    return polygon


def write_data(data_to_write, filename):
    with open(filename, 'w') as file:
        json.dump(data_to_write, file)


if __name__ == "__main__":
    data = read_data('one_percent_smooth.json')
    write_data(data, 'output_boundary_data.json')
