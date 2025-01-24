// pages/about.js
export default function About() {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>O Autorze</h1>
        <p style={styles.description}>
          Małgorzata Giera
        </p>
      </div>
    );
  }
  
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
    },
    title: {
      textAlign: 'center',
      color: '#2c3e50',
    },
    description: {
      marginBottom: '15px',
      color: '#333',
    },
  };
  