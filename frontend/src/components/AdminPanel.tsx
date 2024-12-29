import React, { JSX, useState } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


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
  [key: string]: any;
}

interface QueryResultRow {
  [key: string]: any; 
}

const renderHighChart = (data: { genre: string; count: number }[]): JSX.Element => {

  if (data.length === 0) {
    return (
      <section className="section">
        <h2 className="subtitle">Popular Movie Genres</h2>
        <p>No data available to display.</p>
      </section>
    );
  }

  const options: Highcharts.Options = {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Number of Rentals by Genre',
    },
    xAxis: {
      categories: data.map((d) => d.genre),
      title: {
        text: 'Genres',
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Number of Rentals',
      },
    },
    series: [
      {
        name: 'Rentals',
        type: 'column',
        data: data.map((d) => ({
          name: d.genre, 
          y: d.count,   
        })),
        colorByPoint: true, 
      },
    ],
    tooltip: {
      formatter: function () {
        return `<b>${this.key}</b>: ${this.y} rentals`;
      },
    },
  };

  return (
    <section className="section">
      <h2 className="subtitle">Popular Movie Genres</h2>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </section>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
  const [tableResult, setTableResult] = useState<TableRow[]>([]); // Table button results
  const [queryResult, setQueryResult] = useState<QueryResultRow[]>([]); // Custom query results
  const [error, setError] = useState<string>('');
  const [activeTable, setActiveTable] = useState<string>(''); // Active table for buttons
  const [query, setQuery] = useState<string>(''); // Custom SQL query
  const [showChart, setShowChart] = useState<boolean>(false);
  const [chartData, setChartData] = useState<{ genre: string; count: number }[]>([]);


  // Function to execute an SQL query for a table
  const fetchTableData = async (tableName: string): Promise<void> => {
    try {
      setError('');
      setActiveTable(tableName); 
      const response = await axios.post('http://localhost:5000/execute-sql', {
        query: `SELECT * FROM ${tableName}`,
      });
      setTableResult(response.data.result);
    } catch (err: any) {
      setError(`Error fetching data for ${tableName}.`);
    }
  };

  const loadChartData = async () => {
    try {
      const data = await fetchRentalDataByGenre();
      const transformedData = data.map((item) => ({
        genre: item.GENRE,
        count: item.COUNT,
      }));
      setChartData(transformedData);
      setShowChart(!showChart);
    } catch (err) {
      console.error('Error loading chart data:', err);
    }
  };

  const fetchRentalDataByGenre = async (): Promise<{ GENRE: string; COUNT: number }[]> => {
    try {
      const response = await axios.post('http://localhost:5000/execute-sql', {
        query: `
          SELECT g.genre_name AS genre, COUNT(r.rental_id) AS count
          FROM Genre g
          JOIN Movie_Genre mg ON g.genre_id = mg.genre_id
          JOIN Rental r ON mg.movie_id = r.movie_id
          GROUP BY g.genre_name
          ORDER BY count DESC
        `,
      });
      console.log(response.data.result);
      return response.data.result; // Return the rental data by genre
    } catch (err: any) {
      console.error('Error fetching rental data by genre:', err);
      throw new Error('Failed to fetch data');
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
        <button className="button is-link" onClick={loadChartData}>
          {showChart ? 'Hide Rentals by Genre' : 'Show Rentals by Genre'}
        </button>
      </div>

      {showChart && renderHighChart(chartData)}
      

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
