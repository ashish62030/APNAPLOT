import React, { useState } from "react";
import { contactStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import API_URL from "../../config";
import Navbar from "../../components/common/Navbar";
import {
  HiOutlineAnnotation,
  HiOutlineCheckCircle,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
} from "react-icons/hi";

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: "",
    role: user?.role || "buyer",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //   to submit the data to server side
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/contact`, formData);
      if (res.data.success) {
        setSuccess(true);
        setFormData({ ...formData, message: "" });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      {user?.role !== "seller" && <Navbar />}

      <div className={s.mainContainer}>
        <div className={s.header}>
          <h1 className={s.heading}>Get In Touch</h1>
          <p className={s.subheading}>
            Have questions or feedback? We'd love to hear from you. Our team is
            here to help you with anything you need.
          </p>
        </div>

        <div className={s.grid}>
          <div className={s.contactInfoContainer}>
            <div className={s.contactInfoCard}>
              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapper}>
                  <HiOutlineMail size={24} />
                </div>
                <div>
                  <div className={s.contactTitle}>Email Us</div>
                  <div className={s.contactDetail}>support@realesate.com</div>
                </div>
              </div>

              <div className={s.contactItem}>
                <div className={s.contactIconWrapperAlt}>
                  <HiOutlinePhone size={24} />
                </div>
                <div>
                  <div className={s.contactTitle}>Call Us</div>
                  <div className={s.contactDetail}>+1 (234) 567-7890</div>
                </div>
              </div>
            </div>

            <div className={s.quickSupportCard}>
              <h3 className={s.quickSupportTitle}>Quick Support</h3>
              <p className={s.quickSupportText}>
                Available 24/7 for our premium members. Your satisfaction is our
                priority.
              </p>
            </div>
          </div>

          {/* contact form */}
          <div className={s.formCard}>
            {success ? (
              <div className={s.successContainer}>
                <HiOutlineCheckCircle size={64} className={s.successIcon} />
                <h2 className={s.successTitle}>Message Sent!</h2>
                <p className={s.successMessage}>
                  Thank you for reaching out. We've received your message and
                  will get back to you shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className={s.successButton}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={s.form}>
                <div className={s.formTwoColGrid}>
                  <div className={s.inputGroup}>
                    <label className={s.label}>
                      <HiOutlineUser size={16} className=" mr-1" /> Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={s.input}
                    />
                  </div>
                  <div className={s.inputGroup}>
                    <label className={s.label}>
                      <HiOutlineMail size={16} className=" mr-1" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={s.input}
                    />
                  </div>
                </div>

                <div className={s.inputGroup}>
                  <label className={s.label}>
                    <HiOutlinePhone size={16} className=" mr-1" /> Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className={s.input}
                  />
                </div>

                <div className={s.inputGroup}>
                  <label className={s.label}>
                    <HiOutlineAnnotation size={16} className=" mr-1" /> Message
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    rows="5"
                    className={`${s.input} ${s.textarea}`}
                  ></textarea>
                </div>

                {error && <div className={s.errorMessage}>{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className={s.submitButton}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
