import React from 'react';

const ServiceForm: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-[24px]">
      <div className="relative flex h-[36px] w-full flex-row items-center gap-[16px]">
        <span className="block h-[1px] w-full max-w-[158.5px] bg-[#CFDFE2]"></span>
        <p className="text-md text-center leading-[36px] dark:text-white sm:text-[16px]">
          Hoặc
        </p>
        <span className="block h-[1px] w-full max-w-[158.5px] bg-[#CFDFE2]"></span>
      </div>
    </div>
  );
};

export default ServiceForm;
