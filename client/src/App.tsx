import styles from './index.module.css'
import brainLogo from './assets/brainstorm.png'
import { useState } from 'react'

function App() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent<Element>) => {
    e.preventDefault();
    console.log(query);
    const answer = await generateAnswer();
    setAnswer(answer);
  }

  const generateAnswer = async () => {
    const response = await fetch("http://127.0.0.1:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({content: query})
    });

    const data = await response.json();
    console.log(data)
    return data.content;
  }

  return (
    <main className={styles.main}>
      <img src={brainLogo} className={styles.icon}></img>
      <h3>Chat My Knowledge Base</h3>
      <form onSubmit={handleSubmit}>
        <input type="text"
        name="query"
        placeholder="What question do you want answered?"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setQuery(e.target.value)}}/>

        <input type="submit" value="Generate Answer" />
      </form>
      {answer && <div className={styles.queryOutput}>
        {answer}
      </div>}
      <footer className={styles.footer}>
        <a href="https://www.flaticon.com/free-icons/brain" title="brain icons">Brain icons created by Freepik - Flaticon</a>
      </footer>
    </main>
    
  )
}

export default App
