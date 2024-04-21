const Navbar = () => {
  return (
    <div className="flex p-5 w-screen justify-around">
      <h1 className="relative flex flex-row items-baseline text-2xl font-bold">
        <span className="sr-only">Convey</span>
        <span className="tracking-tight hover:cursor-pointer text-primary">
          Convey
        </span>
        <sup className="absolute right-[calc(100%+.1rem)] top-0 text-xs font-bold text-secondary">
          [BETA]
        </sup>
      </h1>
      <ul className=" hidden sm:flex flex-row gap-6 items-center text-sm">
        <li>
          <a href="">Documentation</a>
        </li>
        <li>
          <a href="">Pricing</a>
        </li>
      </ul>
      <div className="flex items-center gap-4">
        <a
          className="rounded-md bg-primary px-2 py-2 text-[10px] font-semibold text-white shadow-sm hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline focus-visible:outline-primary"
          href="/sign-in"
        >
          Dashboard{" "}
        </a>
      </div>
    </div>
  );
};

export default Navbar;
