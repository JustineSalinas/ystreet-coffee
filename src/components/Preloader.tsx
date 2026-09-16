"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const minTime = new Promise<void>((resolve) =>
      setTimeout(resolve, 1100)
    );
    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true })
          );

    Promise.all([minTime, pageLoaded]).then(() => {
      setLoading(false);
      document.body.style.overflow = "";
    });

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-obsidian"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.div
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/logo-mark.png"
                alt="Y Street Coffee"
                width={64}
                height={64}
                className="invert"
                priority
              />
            </motion.div>
            <p className="font-display italic text-gold-soft text-sm tracking-[0.1em]">
              y street coffee
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
