import api from './client'

interface ApiResponse<T> {
  status:number
  msg:string
  data:T
}

async function unwrap<T>(request:Promise<{data:ApiResponse<T>}>):Promise<T>{
  const response = await request
  return response.data.data
}

export function getFileDetailByCode(code:string){
  return unwrap(
    api.post('/files/detail/code', null, {
      params:{code}
    })
  )
}

export function downloadFileByCode(code:string){
  return `/files/download/byCode?code=${encodeURIComponent(code)}`
}
