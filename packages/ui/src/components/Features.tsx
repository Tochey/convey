interface IProps {
  icon: string;
  title: string;
  desc: string;
}

const feat = [
  {
    icon: "icon1",
    title: "Rich Features",
    desc: "Out-of-the-box support for TypeScript, JSX, CSS and more",
  },
  {
    icon: "icon2",
    title: "Lightning Fast HMR",
    desc: "Hot Module Replacement (HMR) that stays fast regardless of app size",
  },
  {
    icon: "icon2",
    title: "Instant Server Start",
    desc: " On demand file serving over native ESM, no bundling required!",
  },
];

const Feature = ({ icon, title, desc }: IProps) => {
  return (
    <div
      className=" rounded-lg
   p-5 flex flex-col gap-3 bg-[#202127] items-start w-[300px] "
    >
      <div className="flex bg-[#2B2F36]">H</div>
      <h1 className="text-sm font-semibold text-secondary">{title}</h1>
      <h1 className="text-[13px]  text-tertiary">{desc}</h1>
    </div>
  );
};

const Features = () => {
  return (
    <div className="flex gap-5 px-24">
      {feat.map((feat, idx) => {
        return <Feature key={idx} {...feat} />;
      })}
    </div>
  );
};

export default Features;
