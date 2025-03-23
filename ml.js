// Coordinates of Chota Shigri Glacier
var chotashigriglacier = ee.Geometry.Polygon(
        [[[77.61, 32.25], 
          [77.61, 32.35], 
          [77.71, 32.35], 
          [77.71, 32.25]]]);

// Function to calculate water and ice area
function calwaterice(startDate, endDate) {
  // Choosing the satellite and filtering data 
  var sentinel2 = ee.ImageCollection('COPERNICUS/S2_HARMONIZED')
                    .filterDate(startDate, endDate)
                    .filterBounds(chotashigriglacier)
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

  // Creating image with low noise
  var image = sentinel2.median();

  // Calculate NDWI (Normalized Difference Water Index)
  var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
  // Calculate NDSI (Normalized Difference Snow Index)
  var ndsi = image.normalizedDifference(['B3', 'B11']).rename('NDSI');

  // Thresholding: NDWI > 0 for water, NDSI > 0.4 for ice
  var water = ndwi.gt(0);
  var ice = ndsi.gt(0.4);

  // Calculate water area
  var Awater = water.multiply(ee.Image.pixelArea()).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: chotashigriglacier,
    scale: 10,
    maxPixels: 1e9
  }).getNumber('NDWI');  // Use getNumber instead of get

  // Calculate ice area
  var Aice = ice.multiply(ee.Image.pixelArea()).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: chotashigriglacier,
    scale: 10,
    maxPixels: 1e9
  }).getNumber('NDSI');

  // Convert from square meters to square kilometers
  Awater = Awater.divide(1e6);
  Aice = Aice.divide(1e6);

  return { Awater: Awater, Aice: Aice };
}

// Calculate water and ice areas
var Start = calwaterice('2023-01-01', '2023-01-08');
var End = calwaterice('2023-02-09', '2023-02-16');

// Compute percentage change safely
var waterPercentageChange = End.Awater.subtract(Start.Awater)
                            .divide(Start.Awater.max(1)) // Avoid division by zero
                            .multiply(100);

var icePercentageChange = End.Aice.subtract(Start.Aice)
                          .divide(Start.Aice.max(1)) // Avoid division by zero
                          .multiply(100);

// Evaluate before printing
Start.Awater.evaluate(function(val) {
  print('Water - Start (sqkm):', val);
});
End.Awater.evaluate(function(val) {
  print('Water - End (sqkm):', val);
});
waterPercentageChange.evaluate(function(val) {
  print('Change in Water (%):', val);
});

Start.Aice.evaluate(function(val) {
  print('Ice - Start (sqkm):', val);
});
End.Aice.evaluate(function(val) {
  print('Ice - End (sqkm):', val);
});
icePercentageChange.evaluate(function(val) {
  print('Change in Ice (%):', val);
});
