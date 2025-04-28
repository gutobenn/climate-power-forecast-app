import json

import xarray as xr
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import os
import glob

file_path = '/Users/augusto/Projects/Personal/software-for-climate-final-project-data-analysis/data/sfcWind_SAM-22_MOHC-HadGEM2-ES_rcp85_r1i1p1_GERICS-REMO2015_v1_3hr_200601010100-200612302200.nc'

# Load the dataset
ds = xr.open_dataset(file_path)

# Extract wind speed (in m/s)
u10 = ds["sfcWind"]  # [time, lat, lon]

# Adjust to hub height (~100m)
def adjust_height(u_10, z1=10, z2=100, alpha=0.143):
    return u_10 * (z2 / z1) ** alpha

u_hub = adjust_height(u10)

# Define power curve function (Vestas V110-2.0MW)
def turbine_power(v):
    rated = 2000  # kW
    if isinstance(v, xr.DataArray):
        p = xr.zeros_like(v)
        p = xr.where((v >= 3) & (v < 12), rated * ((v - 3) / 9) ** 3, p)
        p = xr.where((v >= 12) & (v <= 25), rated, p)
        return p
    else:
        if v < 3 or v > 25:
            return 0
        elif v <= 12:
            return rated * ((v - 3) / 9) ** 3
        else:
            return rated

# Apply power curve
power_output = turbine_power(u_hub)  # [time, lat, lon], in kW

# Convert to energy (kWh) per 3h timestep
energy_kwh = power_output * 3  # [time, lat, lon]

# Average over time
energy_avg = energy_kwh.mean(dim="time")  # [lat, lon]

# Create output directory if it doesn't exist
output_dir = "output"
os.makedirs(output_dir, exist_ok=True)

# Extract year from filename (e.g., from "..._202601010100-202612302200.nc")
filename = os.path.basename(file_path)
# Find the timestamp part (e.g., "202601010100-202612302200")
timestamp_part = filename.split('_')[-1].split('.')[0]
# Extract the year (first 4 digits of the timestamp)
year = timestamp_part[:4]

energy_avg_df = energy_avg.to_dataframe()

# Fix longitude coordinates
energy_avg_df['lon'] -= 360

# Convert all values to Python floats first
lat_values = energy_avg_df['lat'].values.astype(float)
lon_values = energy_avg_df['lon'].values.astype(float)
wind_values = energy_avg_df['sfcWind'].values.astype(float)

# Create the output dictionary
output = {
    'points': [
        {
            'lat': lat,
            'lon': lon,
            'value': value
        }
        for lat, lon, value in zip(lat_values, lon_values, wind_values)
    ]
}

# Save to a JSON file
with open('energy_data_5.json', 'w') as f:
    json.dump(output, f)

print(f"Processed {file_path}")