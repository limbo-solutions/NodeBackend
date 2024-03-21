// Form.jsx
import React, { useState } from 'react';
import '../assets/main.css';
import Modal from './modal'; // Assuming you have a Modal component

const Form = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    submitted: false,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
      submitted: true,
    }));
    setModalOpen(true);

    // Update table data
    setTableData((prevTableData) => [...prevTableData, formData]);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form-box">
        <h1 className="form-heading">Personal Details</h1>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          required
        />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          required
        />
        <button type="submit">Submit</button>
      </form>

      <Modal isOpen={modalOpen} onClose={closeModal}>
        <h2>Details saved successfully!</h2>
        <p>First Name: {formData.firstName}</p>
        <p>Last Name: {formData.lastName}</p>
        <p>Email: {formData.email}</p>
        <p>Phone Number: {formData.phoneNumber}</p>
        <p>Address: {formData.address}</p>
      </Modal>

      <div className="table-container">
        <table className="submission-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((data, index) => (
              <tr key={index}>
                <td>{data.firstName}</td>
                <td>{data.lastName}</td>
                <td>{data.email}</td>
                <td>{data.phoneNumber}</td>
                <td>{data.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Form;
