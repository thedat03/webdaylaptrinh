import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Course() {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        navigate(`/courses/${id}`, { replace: true });
    }, [id, navigate]);

    return null;
}

export default Course;