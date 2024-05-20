import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Powered By NextJS
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
      <div className={styles.description} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        <div style={{ margin: "20px", fontSize: "16px", lineHeight: "1.5", color: "white" }}>
          <p style={{display:"flex",flexDirection:"column"}}>
            <strong style={{ marginBottom: "10px",fontSize:30 }}>Welcome to Llama AI</strong>
            <strong style={{ color: "blue", fontSize: 20 }}>How to Use</strong>
            <span>Customize Your Message: Simply append <code style={{padding:10, border: "2px solid white", borderRadius: "5px" }}>/api?content=</code> to the URL followed by your desired message. <br></br> For example:</span>
            <br />
            <a target="_blank" href="https://llama-ai.vercel.app/api?content=Hello,%20How%20are%20You%20?" style={{ padding: 10, border: "2px solid white", borderRadius: "5px",display: "flex", alignItems: "center", color: "green", textDecoration: "none", fontSize: 20 }}>
              https://llama-ai.vercel.app/api?content= Hello, How are You ?
            </a>
            <br />
          </p>
        </div>

      </div>
      

      <div className={styles.grid} style={{display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
        <a
          href="https://github.com/AnkitNayak-eth/Llama-AI"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Github <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about This Project and API.</p>
        </a>
      </div>
    </main>
  );
}
