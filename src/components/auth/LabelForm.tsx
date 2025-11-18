import React from 'react';

const LabelForm: React.FC<{ title: string }> = ({ title }) => {
  return (
    <label className=" text-[14px]  leading-[16px] text-[#0C1421] dark:text-white  sm:text-[16px]">
      {title}
    </label>
  );
};

export default LabelForm;
