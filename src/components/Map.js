import './Map.css';
import { useState, useEffect } from 'react';
import "@fontsource/league-spartan/800.css";
import Course from './CourseClass';
import axios from 'axios';
//import { CastRounded } from '@mui/icons-material';
import CustomMenu from './Menu'; // Import the CustomMenu component
import './Tree.css' // Import Tree css

var treeData = []

const searchResult = 'CS709'; // hard coded but doesn't have to be


export default function Map() {
    const [result, setResults] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    
    useEffect(() => {
        const fetchData = async (searchCourse) => {
            try {
                console.log("Searching");
                const response = await axios.get('http://localhost:8000/getClass?course='+searchCourse);
                //console.log(response.data);
                //console.log(response.data.courseInfo.Prerequisites)
                

                response.data.courseInfo.Prerequisites = await response.data.courseInfo.Prerequisites.forEach(e => fetchChildCourse(e));
                console.log(response.data.courseInfo.Prerequisites)
                
                setResults(response.data);
                setLoading(false); // Set loading to false after data is fetched
            } catch (error) {
                console.error('Error searching:', error);
            }
        };

        const fetchChildCourse = async (searchCourse) => {
            try {
                console.log("Searching for prereq");
                const response = await axios.get('http://localhost:8000/getClass?course='+searchCourse);
                
                if (response.data.courseInfo.Prerequisites.length !== 0){
                    response.data.courseInfo.Prerequisites = await response.data.courseInfo.Prerequisites.forEach(e => fetchChildCourse(e));
                }
                return response.data;

            } catch (error) {
                console.error('Error searching:', error);
            }
        };
        fetchData(searchResult);
    }, []);


    if (loading) {
        // Render loading state while data is being fetched
        return <div>Loading...</div>;
    }

    // Check if result and result.courseInfo exist before accessing Prerequisites
    var prereqs = result && result.courseInfo ? result.courseInfo.Prerequisites : [];
    //console.log("PPREREQ", prereqs);

    // example that would be returned in query:
    var courseName = result && result.courseInfo ? result.courseInfo.Name : "";
    var parentCourse = new Course(220, "CS", "Programming Methodology", "...", prereqs && prereqs.length > 0 ? prereqs[0][0] : []);

    console.log(result.courseInfo.Prerequisites)
    createTree(result.courseInfo);

    const results = [parentCourse];
    //console.log(result)
    return (
        <div className="prereq-list">
            <ul>
                {results.map((course) => (
                    <h3 key={course.id} className="course-name">{courseName}</h3>
                ))}
            </ul>
            <div className="container">
                <div className="tree">
                    {
                        treeRendering(treeData)
                    }               
                </div>
                <ul>
                    {results.map((course) => (
                        <p key={course.id}> </p>//Prerequisites: {course.prereqs}</p> 
                    ))}
                </ul>
                <div className="top-bar">
                    <CustomMenu/>
                </div>
            </div>
        </div>
    );
}

function createTree(courseInfo){
   treeData = [];
   treeData.push(createNode(courseInfo));
}

function createNode(courseInfo){
    
    if (courseInfo.Prerequisites = []){ // should be (courseInfo.Prerequisites.length === 0){ 
        return {
            id: courseInfo.id,
            name: courseInfo.Name,
            diamond: false,
            children: []
        }
    }
    else{
        var prereqs = [];
        courseInfo.Prerequisites.forEach(course => prereqs.push(createNode(course)));
        return {
            id: courseInfo.id,
            name: courseInfo.name,
            diamond: false,
            children: prereqs
        }
    }
}

const treeRendering = (treeData) => {
    
    return (
        <ul>
        {
            treeData.map((item)=>                
                <li className={item.name+item.id}>
                    <div>{item.name}</div>
                    {
                        item.children && item.children.length ?
                        treeRendering(item.children)
                        :''
                    }
                </li>
            )                    
        }
        </ul>
    )
}
