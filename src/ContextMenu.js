import React, {useEffect} from 'react';
import './App.css';

export default function ContextMenu({setAnalysisWindow}) {
  useEffect(() => {
    const menu = document.querySelector(".menu");
    let menuVisible = false;

    const toggleMenu = command => {
      menu.style.display = command === "show" ? "block" : "none";
      menuVisible = !menuVisible;
    };

    const setPosition = ({ top, left }) => {
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      toggleMenu("show");
    };

    window.addEventListener("click", e => {
      if (menuVisible) {
        toggleMenu("hide");
      }
    });

    window.addEventListener("contextmenu", e => {
      e.preventDefault();
      const origin = {
        left: e.pageX,
        top: e.pageY
      };
      setPosition(origin);
      return false;
    });
  })
  return (
    <div className="menu">
      <ul className="menu-options">
        <li className="menu-option">Cut</li>
        <li className="menu-option">Copy</li>
        <li className="menu-option">Paste</li>
        <li onClick={() => setAnalysisWindow(true)} className="menu-option">Analysis</li>
      </ul>
    </div>
  )
}