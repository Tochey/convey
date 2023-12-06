import GitHubStrategy from "passport-github2";
import { User } from "../models/User";
import "dotenv/config";  

type GithubLoginProps = {
  accessToken: string;
  refreshToken: string;
  profile: any;
  cb: any;
};

const githubLogin = async ({
  accessToken,
  refreshToken,
  profile,
  cb,
}: GithubLoginProps) => {
  try {
    const email = profile.emails[0].value;
    const githubId = profile.id;
    const oldUser = await User.findOne({ email });
    const ALLOW_SOCIAL_REGISTRATION =
      process.env.ALLOW_SOCIAL_REGISTRATION?.toLowerCase() === "true";

    if (oldUser) {
      await oldUser.save();
      return cb(null, oldUser);
    } else if (ALLOW_SOCIAL_REGISTRATION) {
      const newUser = await User.create({
        name: profile.displayName,
        email,
        githubId,
        emailVerified: profile.emails[0].verified,
        provider: "github",
      });

      return cb(null, newUser);
    }

    return cb(null, false, { message: "User not found." });
  } catch (err) {
    console.error(err);
    return cb(err);
  }
};

export function github() {
  return new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.DOMAIN_SERVER}${process.env.GITHUB_CALLBACK_URL}`,
      proxy: false,
      scope: ["user:email"],
    },
    githubLogin
  );
}
