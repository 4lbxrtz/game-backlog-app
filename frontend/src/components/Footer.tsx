import './Footer.css';

export function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section brand">
                    <span className="footer-logo">
                        <span className="logo-icon">🎮</span> GameBacklog
                    </span>
                    <span className="footer-version">v1.0.0</span>
                </div>

                <div className="footer-section links">
                    <a 
                        href="https://api-docs.igdb.com/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="footer-link"
                    >
                        Powered by IGDB
                    </a>
                    <span className="separator">•</span>
                    <a 
                        href="https://github.com/4lbxrtz/game-backlog-app" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="footer-link"
                    >
                        Contribute on GitHub
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="github-icon">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                    </a>
                </div>

                <div className="footer-section copyright">
                    &copy; {new Date().getFullYear()} GameBacklog
                </div>
            </div>
        </footer>
    );
}