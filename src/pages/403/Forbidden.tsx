import React from 'react';
import { Button, Hero } from 'react-daisyui';
import { Link } from 'react-router-dom';

const NotAccessible: React.FC<object> = () => {
  return (
    <div>
      <Hero
        className="h-screen w-full object-cover"
        style={{
          backgroundImage: `url(https://help.ishosting.com/hubfs/blog/what-is-403-forbidden/403.png)`,
        }}
      >
        <Hero.Overlay />
        <Hero.Content className="text-center">
          <div className="max-w-xl">
            <h1 className="flex text-5xl font-bold text-white">
              {'403 Không được phép truy cập'}
            </h1>
            <p className="py-6 text-white">
              {'Bạn không có quyền truy cập trang này'}
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link to="/">
                <Button color="primary" className="text-white">
                  {'Trang chủ'}
                </Button>
              </Link>

              <Link to="/auth/login">
                <Button color="secondary" className="text-white">
                  {'Đăng nhập'}
                </Button>
              </Link>
            </div>
          </div>
        </Hero.Content>
      </Hero>
    </div>
  );
};

export default NotAccessible;
