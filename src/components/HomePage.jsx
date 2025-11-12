import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./design/HomePage.module.css";
import { prefetchSelfProfile } from "../App"; // import the helper

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>💕</span>
            परफेक्ट मॅच
          </div>
          <nav className={styles.nav}>
            <button
              className={styles.navBtn}
              onClick={() => navigate("/admin-login")}
            >
              Admin
            </button>
            <button
              className={`${styles.navBtn} ${styles.navBtnPrimary}`}
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            तुमच्या आयुष्यातील <span>परफेक्ट जीवनसाथी</span> शोधा
          </h1>
          <p className={styles.heroDesc}>
            जळगाव जिल्ह्यातील बंजारा समाज वधू-वर मेळावा आयोजित करण्यात येत आहे.
            हा मेळावा संपूर्ण समाजातील युवक-युवतींना त्यांच्या जीवनसाथीच्या
            शोधात मदत करण्यासाठी आयोजित केला जात आहे.
          </p>

          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>सदस्य</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>50+</div>
              <div className={styles.statLabel}>यशस्वी जोड्या</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>सुरक्षित</div>
            </div>
          </div>

          <div className={styles.heroBtnGroup}>
            <button
              className={styles.heroBtn}
              onClick={() => navigate("/register")}
            >
              <span>🚀</span>
              सुरुवात करा
            </button>
            <button
              className={styles.heroBtn2}
              onClick={() => navigate("/me")}
              onMouseEnter={prefetchSelfProfile} // 👈 prefetch when hovered
              onFocus={prefetchSelfProfile} // also works for keyboard users
            >
              <span>🧑‍🦰</span>
              View Profile
            </button>
          </div>
        </div>

        <div className={styles.heroRight}>
          <img
            src="./images/Home.png"
            alt="Happy Couple"
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* Success Stories Section */}
      <section className={`${styles.section} ${styles.couples}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>यशस्वी जोडपी</h2>
          <p className={styles.sectionSubtitle}>
            आमच्या माध्यमातून जुळलेल्या यशस्वी जोडप्यांच्या काही कहाण्या
          </p>
        </div>
        <div className={styles.couplesGrid}>
          <div className={styles.coupleCard}>
            <img
              src="./images/couple1.jpg"
              alt="Sneha and Rohan"
              className={styles.coupleImage}
            />
            <div className={styles.coupleContent}>
              <h3 className={styles.coupleName}>स्नेहा ❤️ रोहन</h3>
              <p className={styles.coupleStory}>
                परफेक्ट मॅच मधून आम्ही एकमेकांना भेटलो आणि आता आम्ही सुखी आयुष्य
                जगत आहोत.
              </p>
            </div>
          </div>
          <div className={styles.coupleCard}>
            <img
              src="./images/couple2.jpg"
              alt="Priya and Chetan"
              className={styles.coupleImage}
            />
            <div className={styles.coupleContent}>
              <h3 className={styles.coupleName}>प्रिया ❤️ चेतन</h3>
              <p className={styles.coupleStory}>
                हा मेळावा खरोखरच आमच्या आयुष्यातील सर्वोत्तम निर्णय ठरला.
              </p>
            </div>
          </div>
          <div className={styles.coupleCard}>
            <img
              src="./images/couple3.jpg"
              alt="Sneha and Arjun"
              className={styles.coupleImage}
            />
            <div className={styles.coupleContent}>
              <h3 className={styles.coupleName}>स्नेहा ❤️ अर्जुन</h3>
              <p className={styles.coupleStory}>
                समान विचारांमुळे आम्ही एकमेकांना पटलो आणि आता आम्ही एकत्र आहोत.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>वैशिष्ट्यीकृत प्रोफाइल्स</h2>
          <p className={styles.sectionSubtitle}>
            आमच्या समुदायातील काही उत्कृष्ट प्रोफाइल्स
          </p>
        </div>
        <div className={styles.featuredGrid}>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>👩‍💻</div>
            <h3 className={styles.profileName}>प्रिया एस.</h3>
            <p className={styles.profileInfo}>२५ वर्षे, सॉफ्टवेअर इंजिनीअर</p>
            <p className={styles.profileLocation}>📍 मुंबई, महाराष्ट्र</p>
          </div>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>👨‍⚕️</div>
            <h3 className={styles.profileName}>राहुल एम.</h3>
            <p className={styles.profileInfo}>२८ वर्षे, डॉक्टर</p>
            <p className={styles.profileLocation}>📍 दिल्ली, भारत</p>
          </div>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>👩‍🏫</div>
            <h3 className={styles.profileName}>अंजली के.</h3>
            <p className={styles.profileInfo}>२६ वर्षे, शिक्षक</p>
            <p className={styles.profileLocation}>📍 बंगळुरू, कर्नाटक</p>
          </div>
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar}>👨‍💼</div>
            <h3 className={styles.profileName}>अर्जुन पी.</h3>
            <p className={styles.profileInfo}>३० वर्षे, व्यवसाय मालक</p>
            <p className={styles.profileLocation}>📍 चेन्नई, तमिळनाडू</p>
          </div>
        </div>
      </section>

      {/* Event Information Section */}
      <section className={`${styles.section} ${styles.info}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>मेळावा माहिती</h2>
          <p className={styles.sectionSubtitle}>
            जळगाव जिल्ह्यातील बंजारा समाज वधू-वर मेळावा
          </p>
        </div>
        <div className={styles.infoContent}>
          <p className={styles.heroDesc}>
            हा मेळावा संपूर्ण समाजातील युवक-युवतींना त्यांच्या जीवनसाथीच्या
            शोधात मदत करण्यासाठी आयोजित केला जात आहे.
          </p>

          <ul className={styles.infoList}>
            <li className={styles.infoItem}>
              वधू-वर वय १८ वर्षे आणि त्याहून अधिक
            </li>
            <li className={styles.infoItem}>
              विवाहित होऊ इच्छिणारे युवक-युवती सहभागी होतील
            </li>
            <li className={styles.infoItem}>
              समाजातील सदस्य एकमेकांना ओळखण्याची संधी
            </li>
            <li className={styles.infoItem}>
              वैयक्तिक माहिती, शिक्षण, व्यवसाय याबद्दल माहिती
            </li>
            <li className={styles.infoItem}>
              सामाजिक बंध मजबूत करण्यासाठी महत्त्वाचा मेळावा
            </li>
          </ul>

          <div className={styles.infoDetails}>
            <div className={styles.infoDetailItem}>
              <span>📅</span>
              <strong>तारीख:</strong> [तारीख टाका]
            </div>
            <div className={styles.infoDetailItem}>
              <span>📍</span>
              <strong>ठिकाण:</strong> [ठिकाण टाका], जळगाव जिल्हा
            </div>
            <div className={styles.infoDetailItem}>
              <span>📞</span>
              <strong>संपर्क:</strong> [संपर्क क्रमांक टाका]
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.section}>
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>तयार आहात?</h2>
          <p className={styles.ctaText}>
            आपल्या योग्य जोडीदाराशी भेटण्याची सुवर्णसंधी चुकवू नका. आजच नोंदणी
            करा आणि आपल्या आयुष्यातील सर्वोत्तम निर्णय घ्या.
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => navigate("/register")}
          >
            <span>✨</span>
            आजच नोंदणी करा
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>परफेक्ट मॅच</h3>
            <p>तुमच्या जीवनातील परफेक्ट जोडीदार शोधण्यासाठी विश्वासार्ह मंच.</p>
          </div>

          <div className={styles.footerSection}>
            <h3>संपर्क</h3>
            <ul className={styles.footerList}>
              <li>
                <span>👤</span>
                <strong>नितीन तुळशिराम जाधव</strong>
              </li>
              <li>
                <span>📞</span>
                9049145319
              </li>
              <li>
                <span>🎯</span>
                मुख्य आयोजक
              </li>
              <li>
                <span>🏆</span>
                बंजारा युवा प्रीमियर लीग जळगाव
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>तंत्रज्ञान</h3>
            <ul className={styles.footerList}>
              <li>
                <span>👤</span>
                <strong>पंकज सुकलाल नाईक</strong>
              </li>
              <li>
                <span>📞</span>
                7276028036
              </li>
              <li>
                <span>💻</span>
                वेबसाइट लेखक
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© २०२५ परफेक्ट मॅच. सर्व हक्क राखीव.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
