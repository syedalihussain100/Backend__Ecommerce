const express = require("express");
const router = express.Router();
const { createContact, deleteContact, getAllContacts, getContactById, updateContact } = require("../Controller/ContactControll");


router.route("/contact").post(createContact);
router.route("/contact").get(getAllContacts);
router.route("/contact/:id").get(getContactById);
router.route("/contact/:id").put(updateContact);
router.route("/contact/:id").delete(deleteContact);









module.exports = router;