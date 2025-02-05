"use client";
import { useState, useRef, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { ShootingStars } from "./shooting-stars";
import { StarsBackground } from "./stars-background";
import { HeroHighlight, Highlight } from "./hero-highlight";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [allUserInputs, setAllUserInputs] = useState("");
  const [userId, setUserId] = useState(null); // Store userId in state

  console.log("conversation", allUserInputs);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        storedUserId = uuidv4();
        localStorage.setItem("userId", storedUserId);
      }
      setUserId(storedUserId);
    }
  }, []);

  const fetchResponse = async () => {
    if (!userInput.trim()) return;

    try {
      const updatedMessages = [...messages, { type: "user", text: userInput }];
      setMessages(updatedMessages);
      setUserInput("");
      setHasInteracted(true);

      // Update the allUserInputs state with the latest input
      setAllUserInputs((prev) => (prev ? `${prev}\n${userInput}` : userInput));

      const response = await fetch(
        `/api?content=${encodeURIComponent(allUserInputs + "\n" + userInput)}`
      );
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: data.message || "Sorry, I couldn’t respond.",
        },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Something went wrong. Please try again." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") fetchResponse();
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    });
  }, [messages]);

  const footerLinks = [
    {
      icon: <FaLinkedin className="h-6 w-6 " />,
      href: "https://www.linkedin.com/in/ankitnayaketh/",
    },
    {
      icon: <FaTwitter className="h-6 w-6 " />,
      href: "https://x.com/AnkitNayak_eth",
    },
    {
      icon: <FaGithub className="h-6 w-6 " />,
      href: "https://github.com/AnkitNayak-eth",
    },
  ];

  return (
    <div className="flex flex-col h-screen text-white bg-black">
      {!hasInteracted && (
        <HeroHighlight className="relative z-10">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 transition-all duration-500 relative z-20 font-mono">
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: [20, -5, 0],
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="relative mb-8 z-10 text-5xl md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold"
            >
              What can I help with?
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: [20, -5, 0],
              }}
              transition={{
                duration: 1,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="text-lg text-gray-400"
            >
              Powered by the{" "}
              <Highlight className="text-white">Llama 3.3 70B</Highlight> API
              Highlight, it delivers advanced, context-aware, and human-like
              responses <br></br> for a wide range of AI applications, rivaling
              the capabilities of{" "}
              <Highlight className="text-white">gpt-4.o</Highlight> in both
              performance and versatility.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: [20, -5, 0],
              }}
              transition={{
                duration: 1.5,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="flex gap-4 w-full max-w-xl mt-6"
            >
              <input
                type="text"
                placeholder="Message Llama AI..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full p-4 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchResponse}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
              >
                <IoIosSend size={30} />
              </button>
            </motion.div>
            <motion.nav
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: [20, -5, 0],
              }}
              transition={{
                duration: 2,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="flex flex-row m-8 items-center gap-8"
            >
              {footerLinks.map((link, index) => (
                <a
                  href={link.href}
                  key={index}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transform hover:scale-150 transition-transform duration-300 ease-in-out"
                >
                  <span>{link.icon}</span>
                </a>
              ))}
            </motion.nav>
          </div>
        </HeroHighlight>
      )}

      {hasInteracted && (
        <div className="flex-1 overflow-y-auto px-4 py-6 flex justify-center relative font-mono">
          <div className="w-full max-w-3xl space-y-4 z-10">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-7xl px-4 py-3 rounded-lg ${
                    msg.type === "user"
                      ? "bg-gray-800 text-white rounded-tr-none"
                      : "bg-gray-800 text-white mb-32 rounded-tl-none"
                  }`}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>
          <ShootingStars />
          <StarsBackground />
        </div>
      )}

      {hasInteracted && (
        <div className="w-full border-t border-gray-700 bg-gray-800 p-4 fixed bottom-0 transition-all ease-in-out duration-500 z-10 font-mono">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <input
              type="text"
              placeholder="Message Llama AI..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchResponse}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              <IoIosSend size={30} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
