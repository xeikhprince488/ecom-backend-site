const Feature = require("../../models/Feature");

// Add a new feature image
const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    console.log(image, "image");

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// Get all feature images
const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};




const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Image ID is required" });
    }

    // Find the image and delete it
    const imageToDelete = await Feature.findByIdAndDelete(id);

    if (!imageToDelete) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    return res.status(200).json({
      success: true,
      id: imageToDelete._id, // Return the deleted image's ID
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting the image",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
