// Define the location of Chhota Shigri Glacier
var glacierLocation = ee.Geometry.Point(77.4786, 32.2816); // Coordinates of Chhota Shigri Glacier

// Load Sentinel-3 SLSTR L2 data for Land Surface Temperature
var slstrCollection = ee.ImageCollection('COPERNICUS/S3/SLSTR/L2_LST')
    .filterBounds(glacierLocation)
    .filterDate('2024-08-28', '2024-09-05') // Adjust dates as needed
    .select('LST'); // LST is the Land Surface Temperature band

// Convert temperature from Kelvin to Celsius
var kelvinToCelsius = function(image) {
  return image.subtract(273.15).rename('LST_Celsius');
};

// Apply the Kelvin to Celsius conversion
var slstrCelsius = slstrCollection.map(kelvinToCelsius);

// Get the first image in the filtered collection
var image = slstrCelsius.first();

// Visualize the temperature data
Map.centerObject(glacierLocation, 10);
Map.addLayer(image.clip(glacierLocation), {min: -40, max: 50, palette: ['blue', 'green', 'red']}, 'Temperature (Celsius)');

// Print the temperature value at the glacier location
var temperature = image.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: glacierLocation,
  scale: 1000 // Adjust scale according to the dataset resolution
});

print('Temperature at Chhota Shigri Glacier (Celsius):', temperature);