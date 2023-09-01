import classes from './HeaderEnrollComp.module.scss'
import HeaderLogoComp from '../HeaderLogoComp/HeaderLogoComp'
import TechSupportComp from '../TechSupportComp/TechSupportComp'
import ProfileBlockComp from '../ProfileBlockComp/ProfileBlockComp'

export default function HeaderEnrollComp() {
    return (
        <div className={classes.Wrapper}>
            <HeaderLogoComp />
            <div className={classes.IsShow}>
            <TechSupportComp />
            </div>
            <div className={classes.AdaptiveProfile}>
            <ProfileBlockComp />
            </div>
        </div>
    )
}