import styles from './index.module.css'
import brainLogo from './assets/brainstorm.png'
import { useState } from 'react'

function App() {
  const [queryDescription, setQueryDescription] = useState('');
  // const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent<Element>) => {
    e.preventDefault();
    console.log(queryDescription);
  }

  return (
    <main className={styles.main}>
      <img src={brainLogo} className={styles.icon}></img>
      <h3>Chat My Knowledge Base</h3>
      <form onSubmit={handleSubmit}>
        <input type="text"
        name="query-description"
        placeholder="What question do you want answered?"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {setQueryDescription(e.target.value)}}/>

        <input type="submit" value="Generate Answer" />
      </form>
      <footer className={styles.footer}>
        <a href="https://www.flaticon.com/free-icons/brain" title="brain icons">Brain icons created by Freepik - Flaticon</a>
      </footer>
    </main>
    
  )
}

export default App
