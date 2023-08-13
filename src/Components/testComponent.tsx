//import axios from "axios";

import { memo, useEffect, } from 'react'

export default function TestComponent(props:any) {
    console.log("TestComponent() inside");
    let {fun} = props
    fun();
    useEffect(()=>{
       console.log("inside component did mount");
       
       return ()=>{console.log("Component unmount");
       }
    },[])

    
  return (
    <div>log
    <div>memo</div>
    
    </div>
  )
}

export let MemoizedTestComponent = memo(TestComponent)
