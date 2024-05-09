import Lottie from "react-lottie";
import animation from "../assets/animation.json";

const Hero = () => {
  return (
    <div className="flex ">
      <div className=" p-12 w-full sm:p-24 lg:w-[50%]">
        <h1 className="typography text-5xl sm:text-6xl">
          The fastest way to deploy express applications.
        </h1>
        <h2 className="text-tertiary py-3 text-xl">
          Deploy your express apps without a P.H.D in AWS
        </h2>

        <div className="flex gap-5 my-10 w-full justify-center">
          <div className="flex items-center gap-4">
            <a
              className="rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline focus-visible:outline-primary"
              href="/for-free"
            >
              Get Started for free
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              className="rounded-sm bg-primary px-6 py-3 text-smfont-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline focus-visible:outline-primary"
              href="/for-free"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-[50%]">
        <Lottie
          speed={1.5}
          width={'75%'}
          height={'75%'}
          options={{
            loop: true,
            autoplay: true,
            animationData: animation,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Hero;
