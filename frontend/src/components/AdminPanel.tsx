import React, { JSX, useState } from 'react';
import axios from 'axios';

interface AdminPanelProps {
  user: User|null;
  onLogout: () => void;
}

interface User {
  user_id: number;
  name: string;
  email: string;
  age: number;
  role:string;
}


interface TableRow {
  [key: string]: any; // Generic type for a table row with dynamic keys
}

interface QueryResultRow {
  [key: string]: any; // Same type for SQL query results
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
  const [tableResult, setTableResult] = useState<TableRow[]>([]); // Table button results
  const [queryResult, setQueryResult] = useState<QueryResultRow[]>([]); // Custom query results
  const [error, setError] = useState<string>('');
  const [activeTable, setActiveTable] = useState<string>(''); // Active table for buttons
  const [query, setQuery] = useState<string>(''); // Custom SQL query

  // Function to execute an SQL query for a table
  const fetchTableData = async (tableName: string): Promise<void> => {
    try {
      setError('');
      setActiveTable(tableName); // Set the active table
      const response = await axios.post('http://localhost:5000/execute-sql', {
        query: `SELECT * FROM ${tableName}`,
      });
      setTableResult(response.data.result); // Store table data
    } catch (err: any) {
      setError(`Error fetching data for ${tableName}.`);
    }
  };

  // Function to delete a user
  const deleteUser = async (userId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setError('');
      const response = await axios.post('http://localhost:5000/delete-user', { user_id: userId });
      alert(response.data.message || 'User deleted successfully!');
      fetchTableData('Users'); // Refresh the user list
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error deleting user.');
    }
  };

  // Function to clear the table display
  const clearTableDisplay = (): void => {
    setTableResult([]); // Clear table data
    setActiveTable(''); // Reset active table
  };

  // Function to execute a custom SQL query
  const executeQuery = async (): Promise<void> => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/execute-sql', { query });
      setQueryResult(response.data.result); // Store query results
    } catch (err: any) {
      setError('Error executing SQL query.');
    }
  };

  // Function to render table results
  const renderTable = (): JSX.Element => {
    if (tableResult.length === 0) {
      return <p>No data to display.</p>;
    }
    return (
      <section className="section">
        <h2 className="subtitle">Table Data: {activeTable}</h2>
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              {activeTable === 'Users' && <th style={{ width: '1%' }}>Action</th>}
              {Object.keys(tableResult[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableResult.map((row, index) => (
              <tr key={index}>
                {activeTable === 'Users' && (
                  <td style={{ width: '1%' }}>
                    <button
                      className="button is-danger is-small"
                      style={{ marginLeft: '-15px' }}
                      onClick={() => deleteUser(row.USER_ID)}
                    >
                      Delete
                    </button>
                  </td>
                )}
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  };

  // Function to render custom query results
  const renderQueryResult = (): JSX.Element => {
    if (queryResult.length === 0) {
      return <p>No data to display for the custom query.</p>;
    }
    return (
      <section className="section">
        <h3 className="subtitle">Custom SQL Query Results</h3>
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              {Object.keys(queryResult[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {queryResult.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  };
  
  if(!user){
    return <p>No user is logged in.</p>
  }

  return (
    <div className="container">
      <h1 className="title has-text-centered">Admin Panel</h1>
      {user && <p>Welcome, {user.name}</p>}


      <div className="buttons is-centered">
        <button className="button is-danger" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="buttons is-centered">
        <button className="button is-link" onClick={() => fetchTableData('Users')}>
          Users
        </button>
        <button className="button is-link" onClick={() => fetchTableData('Movie')}>
          Movies
        </button>
        <button className="button is-link" onClick={() => fetchTableData('Genre')}>
          Genres
        </button>
        <button className="button is-link" onClick={() => fetchTableData('Rental')}>
          Rentals
        </button>
        <button className="button is-link" onClick={() => fetchTableData('Rating')}>
          Ratings
        </button>
        <button className="button is-link" onClick={() => fetchTableData('Production_Company')}>
          Production Companies
        </button>
        <button className="button is-warning" onClick={clearTableDisplay}>
          Clear Display
        </button>
      </div>

      {error && <p className="has-text-danger has-text-centered">{error}</p>}

      {renderTable()}

      <section className="section">
        <h2 className="subtitle">Execute a SQL Query</h2>
        <div className="field">
          <label className="label">SQL Query</label>
          <div className="control">
            <textarea
              className="textarea"
              placeholder="Enter your SQL query here"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            ></textarea>
          </div>
        </div>
        <div className="control">
          <button className="button is-link" onClick={executeQuery}>
            Execute
          </button>
        </div>
      </section>

      {renderQueryResult()}
    </div>
  );
};

export default AdminPanel;
