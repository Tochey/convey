import { CustomResponse } from "../../utils/custom-res";
import { Request } from "../../types";
import { Github } from "../../lib/github";
import CustomError from "../../utils/custom-err";
import { createCBDeployment } from "../../lib/codebuild";
import * as UserDAL from "../../dal/user";
import { Deployment, IDeployment } from "@convey/shared";

export async function create(req: Request) {
  const { id } = req.ctx.decodedToken;
  const { url, branch, buildCommand, startCommand, rootDirectory, port } =
    req.body;

  const user = await UserDAL.getUser(id);

  const gh = new Github(url);
  let info: Awaited<ReturnType<typeof gh.validate>>;

  try {
    info = await gh.validate();
  } catch (err: unknown) {
    throw new CustomError(400, (err as Error).message);
  }

  const {
    data: { clone_url },
  } = info;

  const deployment: IDeployment = await Deployment.create({
    user: user._id,
    github_url: clone_url,
    branch,
    buildCommand,
    startCommand,
    rootDirectory,
    port,
  });

  await createCBDeployment(deployment);

  return new CustomResponse("Deployment Queued", deployment, 201);
}
