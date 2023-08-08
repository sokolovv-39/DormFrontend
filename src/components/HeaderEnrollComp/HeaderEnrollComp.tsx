import classes from './HeaderEnrollComp.module.scss'
import HeaderLogoComp from '../HeaderLogoComp/HeaderLogoComp'
import TechSupportComp from '../TechSupportComp/TechSupportComp'
import ProfileBlockComp from '../ProfileBlockComp/ProfileBlockComp'

export default function HeaderEnrollComp() {
    return (
        <div className={classes.Wrapper}>
            <HeaderLogoComp />
            <TechSupportComp />
            <ProfileBlockComp />
        </div>
    )
}