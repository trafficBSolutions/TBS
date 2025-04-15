import { useState } from 'react';
import axios from 'axios';

const RegisterAdmin = () => {
  const [email, setEmail] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const registerAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/admin/register', {
        firstName: first,
        lastName: last,
        email,
        password
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div>
      <h2>Register Admin</h2>
      <form onSubmit={registerAdmin}>
        <input
          type="text"
          placeholder="Enter First Name"
          value={first}
          onChange={(e) => setFirst(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Last Name"
          value={last}
          onChange={(e) => setLast(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register Admin</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterAdmin;

