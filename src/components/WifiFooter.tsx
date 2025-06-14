
import React from 'react';

const WifiFooter = () => {
  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t mt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 ApartmentWiFi. High-speed internet for everyone.
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Support: +254 700 000 000</span>
            <span>Email: support@apartmentwifi.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default WifiFooter;
