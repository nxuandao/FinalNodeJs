const UserModel = require('../Models/User');

const getAllCustomers = async (req, res) => {
  try {
    const customers = await UserModel.find({ role: "user" }).select("-password -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordExpiry");
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } 
};

const updateCustomerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const customer = await UserModel.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    customer.status = status;
    await customer.save();

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error updating customer status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getAllCustomers,
  updateCustomerStatus
};