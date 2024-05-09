interface IProps {
  icon: string;
  title: string;
  desc: string;
}

const feat = [
  {
    icon: "⚡️",
    title: "Lightning Fast Speeds",
    desc: "Go from http://localhost:8080/ to a production ready deployments in seconds",
  },
  {
    icon: "🛺",
    title: "Automatic Deploys",
    desc: "Your app is automatically updated on every push, with zero downtime",
  },
  {
    icon: "😌",
    title: "Ease of use",
    desc: "Just point us at your git repository and we do the rest",
  },
];

const Feature = ({ icon, title, desc }: IProps) => {
  return (
    <div
      className=" rounded-lg
   p-5 flex flex-col gap-3 bg-[#202127] items-start w-[300px] "
    >
      <p>{icon}</p>
      <h1 className="text-sm font-semibold text-secondary">{title}</h1>
      <h1 className="text-[13px]  text-tertiary">{desc}</h1>
    </div>
  );
};

const Features = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-5 px-24 items-center ">
      {feat.map((feat, idx) => {
        return <Feature key={idx} {...feat} />;
      })}
    </div>
  );
};

export default Features;
