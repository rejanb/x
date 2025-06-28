import React, { useState } from 'react';
import '../Styles/SignUp.css';

const monthList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]
const SignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        birthMonth: '',
        birthDay: '',
        birthYear: '',
    });
    const isFormValid = () => {
        const { name, email, birthMonth, birthDay, birthYear } = formData;
        return (
            name.trim() !== '' &&
            email.trim() !== '' &&
            email.includes('@') &&
            birthMonth !== '' &&
            birthDay !== '' &&
            birthYear !== ''
        );
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getDaysInMonth = (month, year) => {
        if (!month) return 31;
        if (month === 2) {
            if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
                return 28;
            }
            return 29;
        }
        return new Date(year, month, 0).getDate();
    };

    return (
        <div className="form-container">
            <div className="logo">X</div>
            <h2>Create your account</h2>

            <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                className="input"
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="input"
            />

            <div className="dob-label">Date of birth</div>
            <p className="dob-desc">
                This will not be shown publicly. Confirm your own age, even if this
                account is for a business, a pet, or something else.
            </p>

            <div className="dob-selects">
                <select name="birthMonth" value={formData.birthMonth} onChange={handleChange}>
                    <option value="">Month</option>
                    {monthList.map((month, index) => (
                        <option key={month} value={index + 1}>{month}</option>
                    ))}
                </select>

                <select name="birthDay" value={formData.birthDay} onChange={handleChange}>
                    <option value="">Day</option>
                    {Array.from({ length: getDaysInMonth(formData.birthMonth , formData.birthYear) }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>

                <select name="birthYear" value={formData.birthYear} onChange={handleChange}>
                    <option value="">Year</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

            <button
                className={`next-button ${!isFormValid() ? 'disabled' : ''}`}
                disabled={!isFormValid()}
                type="submit"
            >
                Next
            </button>
        </div>
    );
};

export default SignUp;
