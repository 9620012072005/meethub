import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await axios.get('/api/users');
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h3>Users</h3>
      <ul>
        {users.map((user) => (
          <li key={user._id} onClick={() => onSelectUser(user._id)}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
