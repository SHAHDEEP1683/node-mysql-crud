const customerService = require('../services/customerService');

exports.createCustomer = customerService.createCustomer;
exports.getAllCustomers = customerService.getAllCustomers;
exports.getCustomerById = customerService.getCustomerById;
exports.updateCustomer = customerService.updateCustomer;
exports.deleteCustomer = customerService.deleteCustomer;
