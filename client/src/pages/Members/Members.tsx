import { UserCirclePlus } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import Loader from '../../components/Loader/Loader'
import { H3, H4 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n'
import { selectUser } from '../../redux/selectors/authSelectors'
import {
    selectHouseholdById,
    selectHouseholds,
    selectHouseholdsLoading,
} from '../../redux/selectors/houseHoldSelectors'
import { selectUsers, selectUsersLoading } from '../../redux/selectors/userSelectors'
import { loadHouseholds, makeOwnerAction, removeMemberAction } from '../../redux/slices/householdsSlice'
import { fetchUsers } from '../../redux/slices/usersSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import InviteMember from './InviteMember/InviteMemberModal'
import './Members.sass'

const Members: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { householdId } = useParams<{ householdId: string }>()
    const households = useSelector(selectHouseholds)
    const householdsLoading = useSelector(selectHouseholdsLoading)
    const users = useSelector(selectUsers)
    const usersLoading = useSelector(selectUsersLoading)
    const user = useSelector(selectUser)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

    const household = useSelector((state: RootState) => selectHouseholdById(state, householdId || ''))
    const isOwner = household?.owner === user?.id

    useEffect(() => {
        dispatch(loadHouseholds())
    }, [dispatch])

    useEffect(() => {
        if (household?.id) {
            dispatch(fetchUsers(household.id))
        }
    }, [dispatch, household])

    useEffect(() => {
        if (household && !isOwner && !householdsLoading) {
            navigate('/households')
        }
    }, [household, isOwner, householdsLoading, navigate])

    const handleRemoveMember = async (memberId: string) => {
        if (!householdId) return
        try {
            await dispatch(removeMemberAction({ householdId, memberId })).unwrap()
            toast.success(t('manage_household.manage_members.toast.remove_member_success'))
            dispatch(loadHouseholds())
            if (household?.id) {
                dispatch(fetchUsers(household.id))
            }
        } catch (error) {
            console.error(t('manage_household.manage_members.console.remove_member_error_prefix'), error)
            toast.error(t('manage_household.manage_members.toast.remove_member_error'))
        }
    }

    const handleMakeOwner = async (memberId: string) => {
        if (!householdId) return
        try {
            await dispatch(makeOwnerAction({ householdId, newOwnerId: memberId })).unwrap()
            toast.success(t('manage_household.manage_members.toast.make_owner_success'))
            dispatch(loadHouseholds())
            if (household?.id) {
                dispatch(fetchUsers(household.id))
            }
        } catch (error) {
            console.error(t('manage_household.manage_members.console.make_owner_error_prefix'), error)
            toast.error(t('manage_household.manage_members.toast.make_owner_error'))
        }
    }

    const getMemberName = (memberId: string) => {
        if (householdsLoading || usersLoading) return t('common.loading_text')
        const user = users[memberId]
        return user ? `${user.name} ${user.surname}` : t('manage_household.manage_members.unknown_user')
    }

    const getMemberRole = (memberId: string) => {
        if (householdsLoading || usersLoading) return t('common.loading_text')
        const user = users[memberId]
        return user?.role === 'owner'
            ? t('manage_household.manage_members.roles.owner')
            : t('manage_household.manage_members.roles.member')
    }

    if (householdsLoading) {
        return <Loader />
    }

    if (!household) {
        return <div>{t('manage_household.manage_members.household_not_found')}</div>
    }

    if (!isOwner) {
        return <div>{t('manage_household.manage_members.no_permission')}</div>
    }

    return (
        <div className="manage-members-container">
            <H3 variant="secondary" className="manage-members-title">
                {t('manage_household.manage_members.title')} {household.name}
            </H3>

            <GradientDiv className="manage-members-content">
                <div className="members-section">
                    <H4 variant="primary" className="section-title">
                        {t('manage_household.manage_members.active_members')}
                    </H4>
                    <div className="section-content">
                        <div className="members-list">
                            {household.members.map((memberId: string) => (
                                <div key={memberId} className="member-item">
                                    <div className="member-info">
                                        <span className="member-name">{getMemberName(memberId)}</span>
                                        <span
                                            className={users[memberId]?.role === 'owner' ? 'owner-tag' : 'member-tag'}>
                                            {getMemberRole(memberId)}
                                        </span>
                                    </div>
                                    {memberId !== household.owner && (
                                        <div className="member-actions">
                                            <Button
                                                variant="default"
                                                className="make-owner-button"
                                                onClick={() => handleMakeOwner(memberId)}>
                                                {t('manage_household.manage_members.actions.make_owner')}
                                            </Button>
                                            <Button
                                                variant="default"
                                                className="remove-button"
                                                onClick={() => handleRemoveMember(memberId)}>
                                                {t('manage_household.manage_members.actions.remove')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="members-section">
                    <H4 variant="primary" className="section-title">
                        {t('manage_household.manage_members.invited_users')}
                    </H4>
                    <div className="section-content">
                        <div className="members-list">
                            {household.invites.map((invitedUserId: string) => {
                                const invitedUser = users[invitedUserId]
                                return (
                                    <div key={invitedUserId} className="member-item">
                                        <div className="member-info">
                                            <span className="member-name">
                                                {invitedUser
                                                    ? `${invitedUser.name} ${invitedUser.surname}`
                                                    : t('common.loading_text')}
                                            </span>
                                            <span className="invited-tag">
                                                {t('manage_household.manage_members.invited_tag')}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="add-member-icon" onClick={() => setIsInviteModalOpen(true)}>
                            <UserCirclePlus size={32} color="#bfbfbf" />
                        </div>
                    </div>
                </div>
            </GradientDiv>

            <InviteMember
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                householdId={householdId || ''}
                existingMembers={household.members}
                invitedUsers={household.invites.map((user: any) => user.id)}
            />
        </div>
    )
}

export default Members
