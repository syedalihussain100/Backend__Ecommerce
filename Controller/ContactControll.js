const asyncHandler = require("express-async-handler");
const { contactModel } = require("../models/Contact");


const createContact = asyncHandler(async (req, res) => {
    const { name, subject, email, message } = req.body;

    // Check if all required fields are provided
    if (!name || !subject || !email || !message) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const contact = await contactModel({
        name,
        subject,
        email,
        message
    });

    res.status(201).json(contact);
});


const getAllContacts = asyncHandler(async (req, res) => {
    const contacts = await contactModel.find({});
    res.status(200).json(contacts);
});

const getContactById = asyncHandler(async (req, res) => {
    const contact = await contactModel.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Contact not found');
    }

    res.status(200).json(contact);
});


const updateContact = asyncHandler(async (req, res) => {
    const contact = await contactModel.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Contact not found');
    }

    const { name, subject, email, message } = req.body;

    // Update contact fields if provided
    if (name) contact.name = name;
    if (subject) contact.subject = subject;
    if (email) contact.email = email;
    if (message) contact.message = message;

    const updatedContact = await contact.save();
    res.status(200).json(updatedContact);
});


const deleteContact = asyncHandler(async (req, res) => {
    const contact = await contactModel.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error('Contact not found');
    }

    await contact.remove();
    res.status(200).json({ message: 'Contact removed' });
});


module.exports = {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact
};