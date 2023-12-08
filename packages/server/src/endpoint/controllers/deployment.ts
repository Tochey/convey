import { CustomResponse } from "../../utils/custom-res";
import { IDeployment, Request } from "../../types";
import { Github } from "../../lib/github";
import CustomError from "../../utils/custom-err";
import { createCBDeployment } from "../../lib/codebuild";
import * as UserDAL from "../../dal/user";
import { Deployment } from "../../models/Deployment";

export async function create(req: Request) {
  const { id } = req.ctx.decodedToken;

  const { url, branch, buildCommand, startCommand, rootDirectory, port } =
    req.body;

  const user = await UserDAL.getUser(id);

  const res = parseInt(port, 10);

  if (isNaN(res)) {
    throw new CustomError(400, "Port must be a number");
  }

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

  await createCBDeployment({
    userId : user._id,
    deploymentId: deployment._id,
    clone_url,
    branch,
    rootDirectory,
    buildCommand,
    startCommand,
    port,
  });

  return new CustomResponse("Deployment Queued", deployment, 201);
}
