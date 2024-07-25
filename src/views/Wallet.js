import React from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Navbar from "../components/Navbar";
import "../styles/Wallet.css";

const Wallet = () => {
  const medals = [
    {
      id: 1,
      title: "Introduction to Cybersecurity",
      image: "/images/badge1.png",
    },
    {
      id: 2,
      title: "AWS Cloud Quest: Cloud Practitioner",
      image: "/images/badge2.png",
    },
    {
      id: 3,
      title: "AWS Cloud Quest: Solutions Architect",
      image: "/images/badge3.png",
    },
    {
      id: 4,
      title: "AWS Academy Graduate - AWS Academy Cloud Foundations",
      image: "/images/badge4.png",
    },
  ];

  return (
    <div className="wallet-page">
      <Navbar />
      <div className="wallet-container">
        <div className="wallet-header">
          <div className="wallet-search-group">
            <input
              type="text"
              className="wallet-search"
              placeholder="Search by name"
            />
            <input
              type="text"
              className="wallet-search"
              placeholder="Search by code"
            />
          </div>
          <div className="wallet-order">
            <span>Order by:</span>
            <select className="wallet-select">
              <option value="assigned-last">assigned last</option>
              <option value="assigned-first">assigned first</option>
              <option value="name">name</option>
            </select>
          </div>
        </div>
        <div className="wallet-info">You have 7 medals</div>
        <div className="wallet-divider"></div>
        <div className="wallet-medals">
          <Carousel
            showArrows={true}
            infiniteLoop={true}
            showThumbs={false}
            showStatus={false}
          >
            {medals.map((medal) => (
              <div key={medal.id} className="wallet-medal-card">
                <img
                  src={medal.image}
                  alt={medal.title}
                  className="medal-img"
                />
                <h3>{medal.title}</h3>
                <button>Details</button>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
