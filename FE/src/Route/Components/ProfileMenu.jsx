import styles from "./ProfileMenu.module.css"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../AuthServices/AuthProvider"
import { useContext } from "react"

export default function ProfileMenu({handleLogoutButton}){
    const navigate = useNavigate()
   

    return(<div className={styles.container}>
        <button className={styles.button} onClick={() => navigate("/profile")}>Profile</button>
        <button className={styles.button} onClick={handleLogoutButton}>Log out</button>
    </div>)
}