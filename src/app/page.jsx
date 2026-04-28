"use client";
import { useState, useRef, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { StarsBackground } from "./stars-background";
import { HeroHighlight, Highlight } from "./hero-highlight";
import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { HoverBorderGradient } from "./hover-border-gradient";
import { Orb } from "./Orb";
import { MarkdownRenderer } from "./MarkdownRenderer";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [allUserInputs, setAllUserInputs] = useState("");
  const [userId, setUserId] = useState(null);
  const [isResponding, setIsResponding] = useState(false);

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

      setIsResponding(true);

      const response = await fetch(
        `/api?text=${encodeURIComponent(allUserInputs + "\n" + userInput)}`
      );
      const textResponse = await response.text();

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "", // Start empty for typing effect
          rawText: textResponse || "Sorry, I couldn't respond.",
          isTyping: true,
        },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setIsResponding(false);
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Something went wrong. Please try again." },
      ]);
    }
  };

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.isTyping) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < lastMsg.rawText.length) {
          setMessages((prev) => {
            const newMessages = [...prev];
            const currentMsg = { ...newMessages[newMessages.length - 1] };

            // Advance by a few characters to make the typing fast
            currentIndex += 3;
            if (currentIndex > lastMsg.rawText.length) {
              currentIndex = lastMsg.rawText.length;
            }

            // No more custom formatResponse, just use the raw text for MarkdownRenderer
            currentMsg.text = lastMsg.rawText.substring(0, currentIndex);
            newMessages[newMessages.length - 1] = currentMsg;
            return newMessages;
          });
        } else {
          clearInterval(interval);
          setIsResponding(false);
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].isTyping = false;
            return newMessages;
          });
        }
      }, 15); // Speed of typing effect

      return () => clearInterval(interval);
    }
  }, [messages.length]);

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
    <div className="flex flex-col h-screen text-white bg-[#0a0a0a]">
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
              <Highlight className="text-white">GPT-OSS 120B</Highlight> API.
              It delivers advanced, context-aware, and human-like
              responses <br></br> for a wide range of AI applications, rivaling
              the capabilities of top-tier models in both
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
              className="flex items-center gap-3 w-full max-w-xl mt-6"
            >
              <HoverBorderGradient
                containerClassName="rounded-full flex-1 !w-full"
                as="div"
                duration={1}
                className="flex items-center w-full !px-0 !py-0"
              >
                <input
                  type="text"
                  placeholder="Message GPT-OSS..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full px-5 py-3.5 bg-transparent text-white text-left placeholder-gray-500 focus:outline-none text-base"
                />
              </HoverBorderGradient>
              <HoverBorderGradient
                containerClassName="rounded-full"
                as="button"
                duration={1}
                onClick={fetchResponse}
                className="flex items-center justify-center !px-4 !py-3.5"
              >
                <IoIosSend size={24} className="text-white" />
              </HoverBorderGradient>
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
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
          <StarsBackground />
        </div>
      )}

      {hasInteracted && (
        <div className="flex-1 overflow-y-auto px-4 py-6 flex justify-center relative font-sans z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-3xl space-y-6 pt-4 pb-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "ai" && (
                  <div className="flex-shrink-0 mr-3 mt-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Orb
                        isResponding={msg.isTyping || false}
                        hoverIntensity={msg.isTyping ? 2.5 : 0.5}
                        rotateOnHover={true}
                        hue={140}
                        forceHoverState={msg.isTyping || false}
                      />
                    </div>
                  </div>
                )}

                <div
                  className={`leading-relaxed break-words ${
                    msg.type === "user"
                      ? "bg-[#1a1a2e] text-gray-100 px-5 py-3 rounded-2xl rounded-tr-sm max-w-[75%] text-[15px]"
                      : "text-gray-200 flex-1 min-w-0 text-[15px]"
                  }`}
                >
                  {msg.type === "user" ? (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator when waiting for response */}
            {isResponding && messages[messages.length - 1]?.type === "user" && (
              <div className="flex w-full justify-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Orb
                      isResponding={true}
                      hoverIntensity={2.5}
                      rotateOnHover={true}
                      hue={140}
                      forceHoverState={true}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 py-3">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>
      )}

      {hasInteracted && (
        <div className="w-full bg-[#0a0a0a] border-t border-[#1e1e2e] p-4 flex-shrink-0 z-10 font-sans">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="flex-1 flex items-center bg-[#141420] border border-[#2a2a3e] rounded-full overflow-hidden focus-within:border-[#4a4a6e] transition-colors">
              <input
                type="text"
                placeholder="Message GPT-OSS..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-5 py-3.5 bg-transparent text-white text-left placeholder-gray-500 focus:outline-none text-[15px]"
              />
            </div>
            <button
              onClick={fetchResponse}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[#141420] border border-[#2a2a3e] hover:border-[#4a4a6e] hover:bg-[#1e1e30] transition-all duration-200 text-gray-300 hover:text-white"
            >
              <IoIosSend size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
