import { useEffect, useRef, useState } from "react"
import FuturePairs from "./FuturePairs"
import axios, { AxiosResponse } from "axios";
import "./Volume.css"
type VolumePercent ={
    pair : string ,
    //vol12 : []
    percent : number
}

export default function Volume() {
    const ref1 = useRef<number>()
    const [vollist,setVolList]=useState<VolumePercent[]>([])
    const [period,Setperiod] = useState("1d")
    const [timer,settimer] = useState<number>(0);
    function getData(){
        let responses : Promise<AxiosResponse>[]=[];
        for(let x of FuturePairs){
            responses.push(axios.get(`https://api.binance.com/api/v3/klines?interval=${period}&limit=13&symbol=${x}`))
        };
        axios.all(responses).then(responses=>{
            let allList :VolumePercent[] = []
            responses.forEach((response:AxiosResponse)=>{
            let volarray : number[]= response.data.map((item : any)=>{
                    return Number(item[5])
            })
            volarray = volarray.reverse()
            console.log(volarray.slice(0,6).reduce((accumulator, currentValue) =>accumulator + currentValue ));

            let volpercent :VolumePercent = {
                pair :response.config.url != undefined?response.config.url.split("&")[2].substring(7):"",
                
                
                percent : Number((volarray.slice(0,7).reduce((i,j)=>i+j) / volarray.slice(7,13).reduce((i,j)=>i+j) * 100).toFixed(2))
            }
                    allList.push(volpercent)

        
            })

              setVolList(allList.sort((i,j)=>{if(i.percent > j.percent) return -1 
                else return 1 
            return 0}))})
        
        }

    useEffect(()=>{
        settimer(10);
        //let  timer :number
        const refreshdatatimer = setInterval(()=>{
            clearInterval(ref1.current)
            console.log("Refresh API");
            ref1.current = setInterval(()=>{
                console.log("inside timer update")
                
                settimer((prev)=>prev>0 ? prev -1 : 10);
                
            },1000)
            getData();
        },10000)
         
       
        
        return ()=>{clearInterval(refreshdatatimer)}
    },[period]);

    useEffect(()=>console.log(vollist),[vollist]
    )
  return (
    <>
    <div ><b style={{color:"white" }}> Volume Percentage Daily  </b> 
        <select onChange={(e)=>
            {   console.log(e.target.value);
            
                Setperiod(e.target.value.toString())}} defaultValue={"1d"}>
            <option>1d</option>
            <option>4h</option>
            <option>1h</option>
            <option>15m</option>
            <option>5m</option>
        </select>
        <button onClick = {getData}>Reloading in {timer}</button>
    </div>
    
    <div>{vollist.map(item=> item.percent > 1.5 ? <div className="item ">{`${item.pair} ==> ${item.percent}`}</div>:undefined)}</div>
    </>
  )
}

