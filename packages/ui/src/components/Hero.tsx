const Hero = () => {
  return (
    <div className=" w-full flex flex-col items-center text-center">
      <h1 className="typography text-5xl sm:text-6xl pt-20">
        The fastest way to deploy express applications.
      </h1>
      <h2 className="text-tertiary py-3 text-xl lg:flex lg:justify-center ">
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
            className="rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline focus-visible:outline-primary"
            href="/for-free"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
