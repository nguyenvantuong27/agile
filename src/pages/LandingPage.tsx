import React from 'react';
import { Button, Hero } from 'react-daisyui';
import { Link } from 'react-router-dom';
const LandingPage: React.FC<object> = () => {
  return (
    <div className="relative">
      <Hero
        className="min-h-screen w-screen"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
      >
        <Hero.Overlay />
        <Hero.Content className="text-center">
          <div className="">
            <h1 className="text-5xl font-bold text-white">
              Chào mừng đến với chúng tôi
            </h1>
            <p className="py-6 text-white">
              Prime Drink - Hệ thống quán bar cao cấp với đội ngũ barista chuyên
              nghiệp và đồ uống chất lượng hàng đầu.
            </p>

            <div className="flex justify-center gap-3">
              <Link to="/auth/login">
                <Button color="primary" className="text-white">
                  Trải nghiệm đồ uống cao cấp và đặt bàn
                </Button>
              </Link>
            </div>
          </div>
        </Hero.Content>
      </Hero>
    </div>
  );
};

export default LandingPage;
