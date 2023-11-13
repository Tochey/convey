import { CustomResponse } from '../../utils/custom-res'
import { Request } from '../../types'

export async function hi(req: Request) {
    // const { uid } = req.ctx.decodedToken

    return new CustomResponse('Hello world', "hi" )
}